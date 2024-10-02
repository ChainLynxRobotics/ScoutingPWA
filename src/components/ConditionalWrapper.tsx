import { ReactElement, ReactNode } from "react";

/**
 * 
 * @param Props - When condition is true, the children will be wrapped in the wrapper function, otherwise the children will be returned as is. 
 * @returns The children wrapped in the wrapper function or as it is.
 */
const ConditionalWrapper = ({ condition, wrapper, children }: 
        { condition: boolean, wrapper: (children: ReactElement) => ReactNode, children: ReactElement }
    ) => condition ? wrapper(children) : children;

export default ConditionalWrapper;