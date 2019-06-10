import { expect } from 'chai';
import { getRealm, realm, Node, initialise } from '../../storage';

const Realm = getRealm();

describe('storage: Node', () => {
    before(() => {
        Realm.clearTestState();

        initialise(() => Promise.resolve(new Int8Array(64)));
    });

    beforeEach(() => {
        realm.write(() => {
            realm.create('Node', {
                url: 'https://testnode1.com:443',
                custom: true,
                pow: false,
            });

            realm.create('Node', {
                url: 'https://testnode2.com:443',
                custom: true,
                pow: true,
            });
        });
    });

    afterEach(() => {
        realm.write(() => realm.delete(Node.data));
    });

    after(() => {
        Realm.clearTestState();
    });

    describe('#getObjectForId', () => {
        describe('when no object for provided url exists', () => {
            it('should return undefined', () => {
                const object = Node.getObjectForId('foo');
                expect(object).to.equal(undefined);
            });
        });

        describe('when an object for provided url exists', () => {
            it('should return node object for provided url', () => {
                const { url, custom, pow } = Node.getObjectForId('https://testnode1.com:443');

                expect(url).to.equal('https://testnode1.com:443');
                expect(custom).to.equal(true);
                expect(pow).to.equal(false);
            });
        });
    });

    describe('#getDataAsArray', () => {
        it('should return all node objects as array', () => {
            const expectedResult = [
                {
                    url: 'https://testnode1.com:443',
                    custom: true,
                    pow: false,
                    token: '',
                    password: '',
                },
                {
                    url: 'https://testnode2.com:443',
                    custom: true,
                    pow: true,
                    token: '',
                    password: '',
                },
            ];

            expect(Node.getDataAsArray()).to.eql(expectedResult);
        });
    });

    describe('#addCustomNode', () => {
        it('should create a new custom node', () => {
            const node = {
                url: 'https://example.com:443',
                password: 'foo',
                token: 'baz@@',
            };

            // Assert that a node with this url does not exist
            expect(Node.getObjectForId(node.url)).to.equal(undefined);

            // Add new node
            Node.addCustomNode(node, true);

            const customNode = Node.getObjectForId(node.url);

            expect(customNode.url).to.equal(node.url);
            expect(customNode.pow).to.equal(true);
            expect(customNode.custom).to.equal(true);
            expect(customNode.password).to.equal(node.password);
            expect(customNode.token).to.equal(node.token);
        });
    });

    describe('#delete', () => {
        it('should delete node object for provided url', () => {
            const url = 'https://testnode1.com:443';

            // Assert that node object exists
            expect(Node.getObjectForId(url)).to.not.equal(undefined);

            Node.delete(url);
            expect(Node.getObjectForId(url)).to.equal(undefined);
        });
    });

    describe('#addNodes', () => {
        describe('when provided node urls already exist', () => {
            it('should update properties', () => {
                const nodes = [
                    {
                        url: 'https://testnode2.com:443',
                        custom: false,
                        pow: true,
                    },
                    {
                        url: 'https://testnode1.com:443',
                        custom: true,
                        pow: false,
                    },
                ];

                // First assert that both urls exist
                nodes.forEach((node) => expect(Node.getObjectForId(node.url)).to.not.equal(undefined));

                // Add nodes
                Node.addNodes(nodes);

                nodes.forEach((node) => {
                    const { url, custom, pow } = node;

                    const updatedNodeObject = Node.getObjectForId(url);

                    expect(updatedNodeObject.custom).to.equal(custom);
                    expect(updatedNodeObject.pow).to.equal(pow);
                });
            });
        });

        describe('when provided node urls do not exist', () => {
            it('should add nodes', () => {
                const nodes = [
                    {
                        url: 'https://testnode3.com:443',
                        custom: false,
                        pow: true,
                    },
                    {
                        url: 'https://testnode4.com:443',
                        custom: true,
                        pow: false,
                    },
                ];

                // First assert that both urls do not exist
                nodes.forEach((node) => expect(Node.getObjectForId(node.url)).to.equal(undefined));

                // Add nodes
                Node.addNodes(nodes);

                nodes.forEach((node) => {
                    const { url, custom, pow } = node;

                    const updatedNodeObject = Node.getObjectForId(url);

                    expect(updatedNodeObject.url).to.equal(url);
                    expect(updatedNodeObject.custom).to.equal(custom);
                    expect(updatedNodeObject.pow).to.equal(pow);
                });
            });
        });
    });
});
