import { useState } from 'react';

const useScroll = () => {
  const [scrollDirection, setScrollDirection] = useState('down'); // Initial scroll direction
  const [previousOffset, setPreviousOffset] = useState(0);

  const handleScroll = event => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset <= 0) {
      setScrollDirection('down');
    } else if (previousOffset > currentOffset) {
      setScrollDirection('down');
      setPreviousOffset(currentOffset);
    } else {
      setScrollDirection('up');
      setPreviousOffset(currentOffset);
    }
  };

  return { scrollDirection, handleScroll };
};

export default useScroll;
