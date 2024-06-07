import { Field, Mina, PrivateKey, AccountUpdate, Bool } from 'snarkyjs';
import { PasswordCircuit } from './PasswordCircuit';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

describe('PasswordCircuit.js', () => {
  describe('PasswordCircuit()', () => {
    it('should be correct', async () => {
      // Initialize local Mina blockchain
      const Local = Mina.LocalBlockchain();
      Mina.setActiveInstance(Local);

      const { privateKey: userKey, publicKey: userAddress } = Local.testAccounts[0];

      // Deploy the smart contract
      const zkAppPrivateKey = PrivateKey.random();
      const zkAppAddress = zkAppPrivateKey.toPublicKey();
      const zkAppInstance = new PasswordCircuit(zkAppAddress);

      const tx = await Mina.transaction(userKey, () => {
        AccountUpdate.fundNewAccount(userAddress);
        zkAppInstance.deploy({ zkappKey: zkAppPrivateKey });
        zkAppInstance.init();
      });
      await tx.sign([userKey, zkAppPrivateKey]).send();

      // User inputs password
      const password = Field.fromBits(Array.from('user_input_password').flatMap((char) => {
        const charCode = char.charCodeAt(0);
        return Array.from({ length: 16 }, (_, i) => new Bool(((charCode >> i) & 1) > 0));
      }));

      // Check password
      const checkPasswordTx = await Mina.transaction(userKey, () => {
        zkAppInstance.checkPassword(password);
      });

      try {
        await checkPasswordTx.prove();
        await checkPasswordTx.sign([userKey]).send();
        console.log('Password is valid');
      } catch (error) {
        console.error('Invalid password', error);
        throw error;
      }
    });
  });
});
