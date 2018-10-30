import { expect } from 'chai';
import { realm, Node } from '../../storage';

describe('storage: Node', () => {
    beforeEach(() => {
        realm.write(() => {
            realm.create('Node', {
                url: 'https://testnode1.com:443',
                custom: false,
                remotePow: false,
            });
            realm.create('Node', {
                url: 'https://testnode2.com:443',
                custom: true,
                remotePow: true,
            });
        });
    });

    afterEach(() => {
        realm.write(() => {
            const nodes = Node.getNodes();
            realm.delete(nodes);
        });
    });

    after(() => {
        realm.close();
    });

    describe('#getNodes', () => {
        describe('when getNodes is called', () => {
            it('should return a list of nodes', () => {
                const nodes = Node.getNodes();
                expect(nodes.isEmpty()).to.equal(false);
            });
        });
    });

    describe('#getRemotePowNodes', () => {
        describe('when getRemotePowNodes is called', () => {
            it('should return a list of nodes that support PoW', () => {
                const powNodes = Node.getRemotePowNodes();
                expect(powNodes.isEmpty()).to.equal(false);
                powNodes.every((object) => {
                    expect(object.remotePow).to.equal(true);
                });
            });
        });
    });

    describe('#addCustomNode', () => {
        describe('when addCustomNode is called', () => {
            it('should create a new custom node', () => {
                const url = 'https://example.com:443';
                Node.addCustomNode(url);
                const customNodes = realm.objects('Node').filtered('custom == true');
                expect(customNodes.isEmpty()).to.equal(false);
            });
        });
    });

    describe('#deleteAllCustomNodes', () => {
        describe('when deleteAllCustomNodes is called', () => {
            it('should delete all custom nodes', () => {
                const customNodes = realm.objects('Node').filtered('custom == true');
                Node.deleteAllCustomNodes();
                expect(customNodes.isEmpty()).to.equal(true);
            });
        });
    });

    describe('#updateRemotePowSupport', () => {
        describe('when updateRemotePowSupport is called', () => {
            it('should update the "remotePow" property of a node', () => {
                const url = 'https://testnode2.com:443';
                Node.updateRemotePowSupport(url, false);
                expect(Node.getRemotePowNodes().isEmpty()).to.equal(true);
            });
        });
    });
});
