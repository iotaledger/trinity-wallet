import Realm from 'realm';
import { TransactionSchema, NodeSchema } from '../schema';

const SCHEMA_VERSION = 0;

class Transaction {
    static schema = TransactionSchema;

    static getTransactions() {
        return realm.objects('Transaction');
    }

    static addTransaction() {
        realm.write(() =>
            realm.create('Transaction', {
                hash: Math.random().toString(),
                value: Math.random(),
                tag: 'TAG',
                message: 'MESSAGE',
            }),
        );
    }
}

class Node {
    static schema = NodeSchema;

    /**
     * Returns a list of nodes
     * @return {Realm.Results}
     */
    static getNodes() {
        return realm.objects('Node');
    }

    /**
     * Returns the list of nodes that support remote PoW
     * @return {Realm.Results}
     */
    static getRemotePowNodes() {
        const nodes = this.getNodes();
        return nodes.filtered('remotePow == true');
    }

    /**
     * Adds a custom node
     * @param {string} url Node URL
     */
    static addCustomNode(url) {
        realm.write(() => {
            realm.create('Node', {
                url: url,
                custom: true,
                // TODO: Where should we check for remote PoW support?
            });
        });
    }

    /**
     * Changes the custom node URL
     * @param  {string} url New node URL
     */
    static editCustomNode(url) {
        const nodes = this.getNodes();
        const customNodes = nodes.filtered('custom == true');
        realm.write(() => {
            realm.delete(customNodes);
        });
        this.addCustomNode(url);
    }

    /**
     * Updates the 'remotePow' field of an existing node
     * @param  {string} url                URL of the node to be updated
     * @param  {boolean} supportsRemotePow Whether the node supports remote PoW
     */
    static updateRemotePowSupport(url, supportsRemotePow) {
        realm.write(() => {
            realm.create(
                'Node',
                {
                    url: url,
                    remotePow: supportsRemotePow,
                },
                true,
            );
        });
    }
}

const realm = new Realm({
    schema: [Transaction, Node],
    schemaVersion: SCHEMA_VERSION,
});

export { realm, Transaction, Node };
