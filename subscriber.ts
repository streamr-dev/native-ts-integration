import { createNetworkNode, StreamMessage } from '@streamr/trackerless-network'
import { hexToBinary, binaryToUtf8,StreamPartIDUtils } from '@streamr/utils'
import { NodeType } from '@streamr/dht'

const run = async () => {
    const stringStreamPartId = process.argv[2]
    if (!stringStreamPartId) {
        console.error('Usage: node subscriber.js <streamPartId>')
        process.exit(1)
    }
    const streamPartId = StreamPartIDUtils.parse(stringStreamPartId)
    const peerDescriptor = {
        nodeId: hexToBinary('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
        type: NodeType.NODEJS,
        websocket: {
            host: '127.0.0.1',
            port: 44211,
            tls: false
        }
    }
    const node = createNetworkNode({
        layer0: {
            peerDescriptor,
            entryPoints: [peerDescriptor],
            websocketServerEnableTls: false
        },
        networkNode: {
            acceptProxyConnections: true
        }
    })
    await node.start()
    await node.join(streamPartId)
    node.addMessageListener((message: StreamMessage) => {
        if (message.body.oneofKind === 'contentMessage') {
            console.log(`Received message: ${binaryToUtf8(message.body.contentMessage.content)}`)
        }
    })
    console.log('Ready to receive messages')
}

run()