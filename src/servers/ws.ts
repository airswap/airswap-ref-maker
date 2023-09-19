import WebSocket from 'ws'
import * as swapDeploys from '@airswap/swap-erc20/deploys.js'
import { Protocols } from '@airswap/constants'

export default class WS {
  constructor(config: any, server: any, protocols: any) {
    const wss = new WebSocket.Server({ server })

    wss.on('connection', (ws: any, req: any) => {
      console.log('Connection', req.socket.remoteAddress)
      ws.on('message', async (message: any) => {
        try {
          let { id, method, params } = JSON.parse(message)
          for (let idx in protocols) {
            protocols[idx].received(
              id,
              method,
              params,
              (response: any) => {
                ws.send(response)
              },
              ws
            )
          }
        } catch (e) {
          console.log('Failed to parse JSON-RPC message', message)
          return
        }
      })
      ws.on('close', () => {
        for (let idx in protocols) {
          protocols[idx].closed(ws)
        }
      })
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'setProtocols',
          params: [
            [
              {
                name: Protocols.LastLookERC20,
                version: '1.0.0',
                params: {
                  senderWallet: config.wallet.address,
                  swapContract: swapDeploys[config.chainId],
                },
              },
            ],
          ],
        })
      )
    })
  }
}
