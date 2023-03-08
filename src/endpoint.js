var host = window.location.hostname; 
const endpoint = `//${process.env.END_POINT || host}:${process.env.PORT || 4002}`;
export { endpoint };
