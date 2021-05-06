export default function range(start, end, choice) {
  const res = [];
  switch (choice) {
    case 0:
      for (let i = start; i <= end; i += 1) {
        res.push(i);
      }
      break;
    case 1:
      for (let i = start; i >= end; i -= 1) {
        res.push(i);
      }
      break;
    default:
  }
  return res;
}
