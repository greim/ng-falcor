/*
 * Utility for paging by appending more to the end of a list.
 */
export default function increasingPager(stepSize) {

  let upperBound = stepSize;

  return Object.freeze({
    more() {
      upperBound += stepSize;
    },
    hasMore(length) {
      return length && length > upperBound;
    },
    indices() {
      const result = [];
      for (let i=0; i<upperBound; i++) {
        result.push(i);
      }
      return result;
    }
  });
}
