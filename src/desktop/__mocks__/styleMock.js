const handler = {
    get: function(_target, name) {
        return name;
    },
};

const proxy = new Proxy({}, handler);

export default proxy;
