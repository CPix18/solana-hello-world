import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaHelloWorld } from "../target/types/solana_hello_world";
import { assert } from "chai"; // Import assert from chai

const { AnchorProvider, web3 } = anchor;

// Configure the client to use the local cluster.
const provider = AnchorProvider.env();
anchor.setProvider(provider);

describe("solana-hello-world", () => {
  const program = anchor.workspace.SolanaHelloWorld as Program<SolanaHelloWorld>;

  it("Can create a message", async () => {
    const message = web3.Keypair.generate();
    const messageContent = "Hello World!";
    await program.rpc.createMessage(messageContent, {
      accounts: {
        message: message.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId, // Fixed here
      },
      signers: [message],
    });

    const messageAccount = await program.account.message.fetch(message.publicKey);

    assert.equal(
      messageAccount.author.toBase58(),
      provider.wallet.publicKey.toBase58()
    );
    assert.equal(messageAccount.content, messageContent);
    assert.ok(messageAccount.timestamp);
  });

  it("Can create and then update a message", async () => {
    const message = web3.Keypair.generate();
    const messageContent = "Hello World!";
    await program.rpc.createMessage(messageContent, {
      accounts: {
        message: message.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId, // Fixed here
      },
      signers: [message],
    });

    const updatedMessageContent = "Solana is cool!";
    await program.rpc.updateMessage(updatedMessageContent, {
      accounts: {
        message: message.publicKey,
        author: provider.wallet.publicKey,
      },
    });

    const messageAccount = await program.account.message.fetch(message.publicKey);

    assert.equal(
      messageAccount.author.toBase58(),
      provider.wallet.publicKey.toBase58()
    );
    assert.notEqual(messageAccount.content, messageContent);
    assert.equal(messageAccount.content, updatedMessageContent);
    assert.ok(messageAccount.timestamp);
  });
});
