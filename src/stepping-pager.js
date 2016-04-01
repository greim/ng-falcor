/*
 * Utility for paging by showing next and prev pages.
 */
export default function increasingPager(stepSize) {

  let lowerBound = 0;
  let upperBound = stepSize;

  return Object.freeze({
    prev() {
      lowerBound = Math.max(0, lowerBound - stepSize);
      upperBound = lowerBound + stepSize;
    },
    next() {
      lowerBound += stepSize;
      upperBound = lowerBound + stepSize;
    },
    hasPrev() {
      return lowerBound > 0;
    },
    hasNext(length) {
      return length && length > upperBound;
    },
    indices() {
      const result = [];
      for (let i=lowerBound; i<upperBound; i++) {
        result.push(i);
      }
      return result;
    },
    pageSize() {
      return stepSize;
    }
  });
}
