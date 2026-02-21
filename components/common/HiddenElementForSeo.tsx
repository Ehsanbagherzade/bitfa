// import React, { ReactNode } from "react";
//
// function HiddenElementForSeo({ children }: { children: ReactNode }) {
//   return <div className="w-0 h-0 overflow-hidden">{children}</div>;
// }
//
// export default HiddenElementForSeo;

import React, { ReactNode } from "react";

function HiddenElementForSeo({ children }: { children: ReactNode }) {
    return (
        <div className="absolute -left-[9999px] top-auto w-auto h-auto overflow-visible">
            {children}
        </div>
    );
}

export default HiddenElementForSeo;