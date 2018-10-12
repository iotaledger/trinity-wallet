import Realm from 'realm';
import { TransactionSchema } from '../schema';

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

const realm = new Realm({
    schema: [Transaction],
    schemaVersion: SCHEMA_VERSION,
});

export { realm, Transaction };
