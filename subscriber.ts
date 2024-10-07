import { createNetworkNode, StreamMessage } from '@streamr/trackerless-network'
import { hexToBinary, binaryToUtf8,StreamPartIDUtils } from '@streamr/utils'
import { createRandomDhtAddress, getDhtAddressFromRaw, NodeType, PeerDescriptor } from '@streamr/dht'
import fs from 'fs'
import path from 'path'

const run = async () => {

    const stringStreamPartId = process.argv[2]
    const useLocalEntryPoint = process.argv.length > 3 && process.argv[3] === "--local"

    const LOCAL_NODE_ID_FILE = path.join(__dirname, 'proxyEthereumAddress.txt')
    const WEBSOCKET_PORT = 44211
    
    if (!stringStreamPartId) {
        console.error('Usage: node subscriber.js <streamPartId> [--local]')
        process.exit(1)
    }

    const globalEntryPoint = {
        nodeId: hexToBinary('d0d14b38d1f6b59d3772a63d84ece0a79e6e1c1f'),
        websocket: {
            host: "95.216.15.80",
            port: WEBSOCKET_PORT,
            tls: false
        },
        type: NodeType.NODEJS
    }
    
    let localNodeId = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    if (!useLocalEntryPoint) {
        try {
            localNodeId = fs.readFileSync(LOCAL_NODE_ID_FILE, 'utf8')
            if (localNodeId === '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') {
                throw new Error('Local node id used without --local flag')
            }
            console.log('Loaded existing proxy Ethereum address ' + localNodeId + ' from ' + LOCAL_NODE_ID_FILE)
        } catch (error) {
            localNodeId = "0x" + createRandomDhtAddress()
            console.log('Created new proxy Ethereum address ' + localNodeId)
        }
    }
    fs.writeFileSync(LOCAL_NODE_ID_FILE, localNodeId)
    console.log('Saved proxy Ethereum address to ' + LOCAL_NODE_ID_FILE)
    
    const localPeerDescriptor = {
        nodeId: hexToBinary(localNodeId),
        type: NodeType.NODEJS
    }

    const localEntryPointPeerDescriptor = {
        nodeId: hexToBinary(localNodeId),
        type: NodeType.NODEJS,
        websocket: {
            host: "127.0.0.1",
            port: WEBSOCKET_PORT,
            tls: false
        }
    }

    const streamPartId = StreamPartIDUtils.parse(stringStreamPartId)
    
    let entryPoints: PeerDescriptor[]
    if (useLocalEntryPoint) {
        entryPoints = [localEntryPointPeerDescriptor]
    } else {
        entryPoints = [globalEntryPoint]
    }
    
    const node = createNetworkNode({
        layer0: {
            peerDescriptor: localPeerDescriptor,
            entryPoints: entryPoints,
            websocketServerEnableTls: false,
            websocketPortRange: {min: WEBSOCKET_PORT, max: WEBSOCKET_PORT}
        },
        networkNode: {
            acceptProxyConnections: true
        }
    })

    await node.start()
    await node.join(streamPartId)
    node.addMessageListener((message: StreamMessage) => {
        if (message.body.oneofKind === 'contentMessage') {
            console.log('Message from ' + getDhtAddressFromRaw(message.messageId!.publisherId))
            console.log(`Received message: ${binaryToUtf8(message.body.contentMessage.content)}`)
        }
    })
    
    console.log('Ready to receive messages')
    if (useLocalEntryPoint) {
        console.log('Using local entry point, the messages will not be seen by other subscribers')
    } else {
        console.log('Using global entry point, the messages will be seen by other subscribers')
    }
    console.log('Streamr Proxy Server Ready to receive messages for streamPartId ' + stringStreamPartId 
        + ' at ws://127.0.0.1:' + WEBSOCKET_PORT)
    console.log('Proxy server Ethereum address: ' + localNodeId)
    
}

run()