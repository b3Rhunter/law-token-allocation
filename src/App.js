import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from './abi.json';

const CONTRACT_ADDRESS = '0x6EDB450DB1C1955113859e8E4dFD968162E0db30';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');

  const [rewardUsername, setRewardUsername] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');

  const [register, setRegister] = useState(false)
  const [openRedeem, setRedeem] = useState(false)
  const [openReward, setReward] = useState(false)

  const [connected, setConnected] = useState(false)
  
    const connect = async () => {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = _provider.getSigner();
      const _contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);
      setConnected(true)
      updateUsers()
    };

  useEffect(() => {
    if (contract) {
      updateUsers();
    }
  }, [contract]);


  const updateUsers = async () => {
    if (!contract) return;

    const userAddresses = await contract.getRegisteredUsers();

    const userBalancesPromises = userAddresses.map(async (address) => {
      const username = await contract.getUsernameByAddress(address);
      const balance = await contract.balanceOfUser(username);
      return {
        username: username,
        address: address,
        balance: balance.toString(),
      };
    });

    const userBalances = await Promise.all(userBalancesPromises);
    setUsers(userBalances);
  };

  const registerUser = async (username, address, amount) => {
    if (!contract) return;

    try {
      const tx = await contract.registerUser(username, address, amount);
      await tx.wait();
      updateUsers()
      console.log('User registered successfully');
    } catch (err) {
      console.error('Error registering user:', err);
    }
  };

  const redeem = async (amount) => {
    if (!contract) return;

    try {
      const tx = await contract.redeem(amount);
      await tx.wait();
      updateUsers()
      console.log('Tokens redeemed successfully');
    } catch (err) {
      console.error('Error redeeming tokens:', err);
    }
  };


  const rewardUser = async (username, amount) => {
    if (!contract) return;

    try {
      const tx = await contract.mint(username, amount);
      await tx.wait();
      console.log('User rewarded successfully');

      // Call updateUsers after user is rewarded
      updateUsers();

    } catch (err) {
      console.error('Error rewarding user:', err);
    }
  };

  const registerNewUser = () => {
    setRegister(true)
  }

  const closeRegister = () => {
    setRegister(false)
  }

  const openRedemption = () => {
    setRedeem(true)
  }

  const closeRedemption = () => {
    setRedeem(false)
  }

  const openRewardUser = () => {
    setReward(true)
  }

  const closeReward = () => {
    setReward(false)
  }

  return (
    <div className="App">
      <h1 style={{ textAlign: "center" }}>Law Allocation Platform</h1>

      <button className='connect' onClick={connect}>
        {!connected && (
          <p>connect</p>
        )}
        {connected && (
          <p>connected</p>
        )}
      </button>

      <div className='menu'>
      <button className='registerUser' onClick={registerNewUser}>Register New User</button>
      <button className='openRedeem' onClick={openRedemption}>Redeem Law Tokens</button>
      <button className='rewardUserBtn' onClick={openRewardUser}>Reward User</button>
      </div>

      <div className='selectUser'>
        <select
          onChange={(e) => setSelectedUser(users.find((user) => user.username === e.target.value))}
        >
          <option>Select a user</option>
          {users.map((user) => (
            <option key={user.address} value={user.username}>
              <p>{user.username} - {user.balance} LAW</p>
            </option>
          ))}
        </select>
      </div>


      {selectedUser && (
        <div className='selectedUser'>
          <p>Name: {selectedUser.username}</p>
          <p>Address: {selectedUser.address}</p>
          <p>Balance: {selectedUser.balance} LAW</p>
        </div>
      )}

      {register && (
        <div className='register'>
          <h2>Register User</h2>
          <div>
            <input
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Address"
              onChange={(e) => setUserAddress(e.target.value)}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Amount"
              onChange={(e) => setTokenAmount(e.target.value)}
            />
          </div>
          <div>
            <button onClick={() => registerUser(username, userAddress, tokenAmount)}>
              Register User
            </button>
            <button className='closeRegister' onClick={closeRegister}>close</button>
          </div>
        </div>
      )}

      {openRedeem && (
        <div>
          <h2>Redeem Tokens</h2>
          <input
            type="number"
            placeholder="Amount"
            onChange={(e) => setRedeemAmount(e.target.value)}
          />
          <button onClick={() => redeem(redeemAmount)}>Redeem Tokens</button>
          <button onClick={closeRedemption}>close</button>
        </div>
      )}

      {openReward && (
        <div className='rewardUser'>
          <h2>Reward User</h2>
          <div>
            <input
              type="text"
              placeholder="Username"
              onChange={(e) => setRewardUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Amount"
              onChange={(e) => setRewardAmount(e.target.value)}
            />
          </div>
          <button onClick={() => rewardUser(rewardUsername, rewardAmount)}>
            Reward User
          </button>
          <button onClick={closeReward}>close</button>
        </div>
      )}



    </div>
  );
}

export default App;
