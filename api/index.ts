// Imports the compiled backend (see buildCommand in vercel.json): Vercel only traces
// plain .js, so the shared .tsx preview component must already be emitted as JS.
import app from '../backend/dist/backend/src/app.js';

export default app;
