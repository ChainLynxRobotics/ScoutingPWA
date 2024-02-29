import { HTMLProps } from "react";

export default function Divider(props: HTMLProps<HTMLDivElement>) {
    return (
        <div {...props} className={"mt-8 mb-2 w-full max-w-md h-1 bg-background-secondary "+props.className}></div>
    )
}