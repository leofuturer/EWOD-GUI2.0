export default function range(start, end) {
  // Brian's genius code
  if (start > end) {
    return [...Array(start - end + 1).keys()].map((num) => num + end).reverse();
  }
  return [...Array(end - start + 1).keys()].map((num) => num + start);
}
