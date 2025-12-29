import React from 'react'
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

export default function ImageLazyLoading(props) {
    return (
        <LazyLoadImage
            src={props.src}
            alt={props.alt}
            effect={props.effect || "blur"}
            style={props.style}
            wrapperClassName={props.wrapperClassName || "image-wrapper"}
            onLoad={props.onLoad}
            width={props.width || "100%"}
            height={props.height || "100%"}
            onClick={props.onClick}
            visibleByDefault={props.visibleByDefault || false}

        />
    )
}
