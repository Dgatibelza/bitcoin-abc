// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ChildProcess } from 'node:child_process';
import { EventEmitter, once } from 'node:events';
import { ChronikClientNode, Tx_InNode } from '../../index';
import initializeTestRunner from '../setup/testRunner';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Get blocktxs, txs, and history for SLP NFT1 token txs', () => {
    let testRunner: ChildProcess;
    let chronik_url: Promise<Array<string>>;
    let get_slp_nft1_genesis_txid: Promise<string>;
    let get_slp_nft1_mint_txid: Promise<string>;
    let get_slp_nft1_send_txid: Promise<string>;
    let get_slp_nft1_child_genesis1_txid: Promise<string>;
    const statusEvent = new EventEmitter();

    before(async () => {
        testRunner = initializeTestRunner('chronik-client_token_slp_nft1');

        testRunner.on('message', function (message: any) {
            if (message && message.chronik) {
                console.log('Setting chronik url to ', message.chronik);
                chronik_url = new Promise(resolve => {
                    resolve([message.chronik]);
                });
            }
            if (message && message.slp_nft1_genesis_txid) {
                get_slp_nft1_genesis_txid = new Promise(resolve => {
                    resolve(message.slp_nft1_genesis_txid);
                });
            }

            if (message && message.slp_nft1_mint_txid) {
                get_slp_nft1_mint_txid = new Promise(resolve => {
                    resolve(message.slp_nft1_mint_txid);
                });
            }

            if (message && message.slp_nft1_send_txid) {
                get_slp_nft1_send_txid = new Promise(resolve => {
                    resolve(message.slp_nft1_send_txid);
                });
            }

            if (message && message.slp_nft1_child_genesis1_txid) {
                get_slp_nft1_child_genesis1_txid = new Promise(resolve => {
                    resolve(message.slp_nft1_child_genesis1_txid);
                });
            }

            if (message && message.status) {
                statusEvent.emit(message.status);
            }
        });
    });

    after(() => {
        testRunner.send('stop');
    });

    beforeEach(async () => {
        await once(statusEvent, 'ready');
    });

    afterEach(() => {
        testRunner.send('next');
    });

    const CHAIN_INIT_HEIGHT = 100;
    const SCRIPTSIG_OP_TRUE_PAYLOAD =
        'da1745e9b549bd0bfa1a569971c77eba30cd5a4b';
    const BASE_TOKEN_ENTRY = {
        // omit tokenId, txType, and tokenType as these should always be tested
        isInvalid: false,
        burnSummary: '',
        failedColorings: [],
        actualBurnAmount: '0',
        intentionalBurn: '0',
        burnsMintBatons: false,
    };
    let slpGenesisTxid = '';
    let slpMintTxid = '';
    let slpSendTxid = '';
    let slpChildGenesisTxid = '';

    let slpGenesis: Tx_InNode;
    let slpMint: Tx_InNode;
    let slpSend: Tx_InNode;
    let slpChildGenesis: Tx_InNode;

    it('Gets an SLP NFT1 genesis tx from the mempool', async () => {
        const chronikUrl = await chronik_url;
        const chronik = new ChronikClientNode(chronikUrl);

        slpGenesisTxid = await get_slp_nft1_genesis_txid;

        slpGenesis = await chronik.tx(slpGenesisTxid);

        // We get a Entries of expected shape, with tokenId the txid for a genesis tx
        expect(slpGenesis.tokenEntries).to.deep.equal([
            {
                ...BASE_TOKEN_ENTRY,
                tokenId: slpGenesisTxid,
                txType: 'GENESIS',
                tokenType: {
                    number: 129,
                    protocol: 'SLP',
                    type: 'SLP_TOKEN_TYPE_NFT1_GROUP',
                },
            },
        ]);

        // The token did not fail parsings
        expect(slpGenesis.tokenFailedParsings).to.deep.equal([]);

        // Normal status
        expect(slpGenesis.tokenStatus).to.eql('TOKEN_STATUS_NORMAL');
    });
    it('Gets an SLP NFT1 mint tx from the mempool', async () => {
        const chronikUrl = await chronik_url;
        const chronik = new ChronikClientNode(chronikUrl);

        slpMintTxid = await get_slp_nft1_mint_txid;

        slpMint = await chronik.tx(slpMintTxid);

        // We get a Entries of expected shape, with tokenId the txid of the genesis tx
        expect(slpMint.tokenEntries).to.deep.equal([
            {
                ...BASE_TOKEN_ENTRY,
                tokenId: slpGenesisTxid,
                txType: 'MINT',
                tokenType: {
                    number: 129,
                    protocol: 'SLP',
                    type: 'SLP_TOKEN_TYPE_NFT1_GROUP',
                },
            },
        ]);

        // The token did not fail parsings
        expect(slpMint.tokenFailedParsings).to.deep.equal([]);

        // Normal status
        expect(slpMint.tokenStatus).to.eql('TOKEN_STATUS_NORMAL');
    });
    it('Gets an SLP NFT1 send tx from the mempool', async () => {
        const chronikUrl = await chronik_url;
        const chronik = new ChronikClientNode(chronikUrl);

        slpSendTxid = await get_slp_nft1_send_txid;

        slpSend = await chronik.tx(slpSendTxid);

        // We get a Entries of expected shape, with tokenId the txid of the genesis tx
        expect(slpSend.tokenEntries).to.deep.equal([
            {
                ...BASE_TOKEN_ENTRY,
                tokenId: slpGenesisTxid,
                txType: 'SEND',
                tokenType: {
                    number: 129,
                    protocol: 'SLP',
                    type: 'SLP_TOKEN_TYPE_NFT1_GROUP',
                },
            },
        ]);

        // The token did not fail parsings
        expect(slpSend.tokenFailedParsings).to.deep.equal([]);

        // Normal status
        expect(slpSend.tokenStatus).to.eql('TOKEN_STATUS_NORMAL');
    });
    it('Gets an SLP NFT1 child genesis tx from the mempool', async () => {
        const chronikUrl = await chronik_url;
        const chronik = new ChronikClientNode(chronikUrl);

        slpChildGenesisTxid = await get_slp_nft1_child_genesis1_txid;

        slpChildGenesis = await chronik.tx(slpChildGenesisTxid);

        // We get a Entries of expected shape, with groupTokenId the txid of the genesis tx for this group
        // and tokenId of this txid
        expect(slpChildGenesis.tokenEntries).to.deep.equal([
            {
                ...BASE_TOKEN_ENTRY,
                tokenId: slpChildGenesisTxid,
                txType: 'GENESIS',
                tokenType: {
                    number: 65,
                    protocol: 'SLP',
                    type: 'SLP_TOKEN_TYPE_NFT1_CHILD',
                },
                groupTokenId: slpGenesisTxid,
            },
            {
                ...BASE_TOKEN_ENTRY,
                tokenId: slpGenesisTxid,
                txType: 'NONE',
                tokenType: {
                    number: 129,
                    protocol: 'SLP',
                    type: 'SLP_TOKEN_TYPE_NFT1_GROUP',
                },
            },
        ]);

        // The token did not fail parsings
        expect(slpChildGenesis.tokenFailedParsings).to.deep.equal([]);

        // Normal status
        expect(slpChildGenesis.tokenStatus).to.eql('TOKEN_STATUS_NORMAL');
    });
    it('Can get all of the above txs from the blockTxs endpoint after they are mined in a block', async () => {
        const chronikUrl = await chronik_url;
        const chronik = new ChronikClientNode(chronikUrl);

        const blockTxs = await chronik.blockTxs(CHAIN_INIT_HEIGHT + 2);

        // Clone as we will use blockTxs.txs later
        const txsFromBlock = JSON.parse(JSON.stringify(blockTxs.txs));

        // The first tx is the coinbase tx, which is not a token
        const coinbaseTx = txsFromBlock.shift()!;

        expect(coinbaseTx.tokenEntries).to.deep.equal([]);
        expect(coinbaseTx.tokenFailedParsings).to.deep.equal([]);
        expect(coinbaseTx.tokenStatus).to.eql('TOKEN_STATUS_NON_TOKEN');

        // The next txs are alphabetical by txid
        const broadcastTxs = [
            slpGenesis,
            slpMint,
            slpSend,
            slpChildGenesis,
        ].sort((a, b) => a.txid.localeCompare(b.txid));

        // The token fields of Tx_InNode(s) from blockTxs match the Tx_InNode(s) from tx
        // Note the txs are not expected to fully match bc now we have block and spentBy keys,
        // which are expected after confirmation
        // Full endpoint output is tested in blocktxs_and_tx_and_rawtx.ts
        for (const tx of broadcastTxs) {
            const nextTxFromBlock = txsFromBlock.shift()!;
            expect(tx.tokenEntries).to.deep.equal(nextTxFromBlock.tokenEntries);
            expect(tx.tokenFailedParsings).to.deep.equal(
                nextTxFromBlock.tokenFailedParsings,
            );
            expect(tx.tokenStatus).to.deep.equal(nextTxFromBlock.tokenStatus);
        }
        // These are the only txs in from blockTxs
        expect(txsFromBlock.length).to.eql(0);

        // i.e., the coinbase tx + the 4 NFT1 txs broadcast
        expect(blockTxs.numTxs).to.eql(5);

        // We can also get the expected Tx shape by calling the script.history()
        const history = await chronik
            .script('p2sh', SCRIPTSIG_OP_TRUE_PAYLOAD)
            .history();

        // Same as blockTxs, except different coinbase tx
        // Remove coinbase tx from both to compare
        // For blockTxs, it's the first tx
        blockTxs.txs.shift();

        // For historyTxs, it's the last (oldest in time)
        history.txs.pop();

        // We are not exhaustively testing the script endpoint here, see script_endpoints.ts
        expect(history.txs).to.have.deep.members(blockTxs.txs);

        // Same tx count as blockTxs
        expect(history.numTxs).to.eql(5);
    });
});