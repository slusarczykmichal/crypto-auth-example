//@ts-nocheck
import axios from 'axios';
import Web3 from 'web3';

const baseEndpoint = 'http://localhost:5001';

function getProvider() {
  return window.ethereum;
}

const web3 = new Web3(getProvider());

let connectedWallet;

async function connectWallet() {
  const provider = getProvider();

  if (!provider) {
    throw new Error('Wallet is not installed!');
  }

  const accounts = await provider.request({
    method: 'eth_requestAccounts',
  });
  connectedWallet = accounts[0];
  console.log('Connected to a wallet of address', connectedWallet);
}

async function authenticate() {
  const auth = await axios.get(
    `${baseEndpoint}/authMessage/${connectedWallet}`
  );

  const signature = await web3.eth.personal.sign(
    web3.utils.utf8ToHex(auth.data.authMessage),
    connectedWallet
  );

  console.log('Signature:', signature);

  const authenticated = await axios.post(
    `${baseEndpoint}/auth/${connectedWallet}`,
    {
      signature: signature,
    }
  );

  console.log(authenticated.data);
}

const connectButton = document.createElement('button');
connectButton.innerHTML = 'Connect Wallet';
connectButton.onclick = async function () {
  await connectWallet();
};
document.body.appendChild(connectButton);

const authButton = document.createElement('button');
authButton.innerHTML = 'Authenticate';
authButton.onclick = async function () {
  await authenticate();
};
document.body.appendChild(authButton);
