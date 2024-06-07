import { Field, SmartContract, state, State, method, Bool } from 'snarkyjs';

export class PasswordCircuit extends SmartContract {
  @state(Field) passwordHash = State<Field>();

  init() {
    super.init();
    // Get the stored hash from the environment variable
    const storedHashValue = process.env.STORED_HASH_VALUE;
    if (!storedHashValue) {
      throw new Error('STORED_HASH_VALUE is not set in the environment variables');
    }
    const storedHash = this.stringToField(storedHashValue);
    this.passwordHash.set(storedHash);
  }

  @method checkPassword(password: Field) {
    const storedHash = this.passwordHash.get();
    const inputHash = this.hashPassword(password);
    inputHash.assertEquals(storedHash);
  }

  hashPassword(password: Field): Field {
    // Simple hash function example (replace with a cryptographic hash function)
    return password.add(password).add(password); // Replace with an actual hash function
  }

  stringToField(str: string): Field {
    // Convert string to Field by first converting it to a bit array of booleans
    const bits: Bool[] = Array.from(str).flatMap((char) => {
      const charCode = char.charCodeAt(0);
      return Array.from({ length: 16 }, (_, i) => new Bool(((charCode >> i) & 1) > 0));
    });
    return Field.fromBits(bits);
  }
}
