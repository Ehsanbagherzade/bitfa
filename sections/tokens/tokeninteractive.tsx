'use client';

import TokenPage from "@/components/features/token/TokenPage";

interface Props {
    params: any;
    token: any;
}

export default function TokenInteractive({ params, token }: Props) {
    return (
        <>
            <TokenPage params={params} token={token} />
        </>
    );
}