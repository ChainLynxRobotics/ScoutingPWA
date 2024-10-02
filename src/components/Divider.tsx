import { HTMLProps } from "react";

/**
 * A simple divider component that is a gray horizontal line.
 * 
 * @param props - Passed to the root div element.
 * @returns 
 */
export default function Divider(props: HTMLProps<HTMLDivElement>) {
    return (
        <div {...props} className={"mt-8 mb-2 w-full max-w-md h-1 bg-background-secondary "+props.className}></div>
    )
}