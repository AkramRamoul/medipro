import express from 'express';
const app = express();
try {
    app.get('/:all*', (req, res) => res.send('ok'));
    console.log('Valid pattern: /:all*');
} catch (e) {
    console.error('Invalid pattern: /:all*', e.message);
}

try {
    app.get('*all', (req, res) => res.send('ok'));
    console.log('Valid pattern: *all');
} catch (e) {
    console.error('Invalid pattern: *all', e.message);
}

try {
    app.get('/*', (req, res) => res.send('ok'));
    console.log('Valid pattern: /*');
} catch (e) {
    console.error('Invalid pattern: /*', e.message);
}
