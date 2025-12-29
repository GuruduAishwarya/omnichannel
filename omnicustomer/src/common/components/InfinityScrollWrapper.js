import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const InfiniteScrollWrapper = ({
    dataLength,
    next,
    hasMore,
    loader,
    inverse,
    scrollableTarget,
    children,
    className
}) => {
    return (
        <InfiniteScroll
            dataLength={dataLength}
            next={next}
            hasMore={hasMore}
            loader={loader}
            inverse={inverse}
            className={className}
            scrollableTarget={scrollableTarget}
        >
            {children}
        </InfiniteScroll>
    );
};

export default InfiniteScrollWrapper;
