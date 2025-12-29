import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonLoader = () => {
  return (
    <>
      {/* <SkeletonTheme baseColor="#202020" highlightColor="#444"> */}
      <Skeleton />
      <Skeleton count={5} />
      {/* </SkeletonTheme> */}
    </>
  );
};

export default SkeletonLoader;
