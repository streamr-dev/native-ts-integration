# native-ts-integration

## Install

`./install.sh`
`npm i`
`npm run build`

## Run subscriber

`node dist/subscriber.js <StreamPartID>`

The node runs with the following PeerDescriptor:

```
{
    nodeId: hexToBinary('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
    type: NodeType.NODEJS,
    websocket: {
        host: '127.0.0.1',
        port: 44211,
        tls: false
    }
}
```

The Node outputs ´Ready to receive messages´ once it is ready.