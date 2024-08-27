import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { keccakAsHex } from '@polkadot/util-crypto';

import { ApiPromise, WsProvider } from '@polkadot/api';

import { handle } from 'frog/vercel'

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'Frog Frame',
})


app.frame('/', (c) => {
  return c.res({
    action: '/finish',
    image: (
      <div style={{
        backgroundColor: 'crimson',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        flex: 1,
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 80,
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center'
        }}>
          Try Substrate ✨
        </div>
        <p style={{
          fontSize: 42,
          lineHeight: '1.5',
          margin: '0'
        }}>
          Remark with your EVM wallet on any substrate chain in just 2 clicks!
        </p>
      </div>
      
    ),
    intents: [
      <TextInput placeholder="What's happening?" />,
      <Button.Signature target="/sign">Sign Remark</Button.Signature>
    ]
  })
})

app.frame('/finish', (c) => {
  const { transactionId } = c

  // Send transaction on-chain for the user.


  // Ask user to wait in the UI.

  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Signature: {transactionId}
      </div>
    )
  })
})

app.signature('/sign', async (c) => {
  // Connect to a Substrate node
  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });

  const calls = [
    api.tx.system.remarkWithEvent('hi'),
  ];

  // Encode the calls
  const encodedCalls = api.createType('Vec<Call>', calls).toU8a();

  const callHash = keccakAsHex(encodedCalls);

  return c.signTypedData({
    chainId: 'eip155:84532',
    types: {
      Swamp: [{ name: 'calls_hash', type: 'string' }],
    },
    primaryType: 'Swamp',
    message: {
      calls_hash: callHash
    },
  })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
