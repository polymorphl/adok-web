exports = module.exports = function(io, room, _nsp) {
  var nsp = (typeof _nsp !== 'string') ? '/' : _nsp;

  if (io.nsps[nsp].adapter.rooms[room])
    return Object.keys(io.nsps[nsp].adapter.rooms[room]);
  return [];
}
