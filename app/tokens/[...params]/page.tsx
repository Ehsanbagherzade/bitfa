import { searchToken, getTokenDescription } from "@/services/http/token.http";
import TokenHeader from "@/sections/tokens/tokenheader";
import TokenInteractive from "@/sections/tokens/tokeninteractive";
import TokenSeoContent from "@/sections/tokens/tokenseocontent";


interface Props {
    params: { params: [string, string] };
}

export default async function Page({ params }: Props) {
    const searchedToken = await searchToken({
        params: {
            currencyAddress: params.params[1],
        },
    });

    const tokenDescription = await getTokenDescription(
        params.params[1]
    );

    const tokenName =
        searchedToken.data?.[0]?.attributes?.name?.split("/")[0] ??
        "Token";

    const seoContent =
        tokenDescription?.data?.data?.content ?? "";

    return (
        <div>

            {/* Server SEO header */}
            <TokenHeader
                tokenName={tokenName}
                params={params}
            />

            {/* Client interactive */}
            <TokenInteractive
                params={params}
                token={searchedToken}
            />

            {/* Server SEO content */}
            <TokenSeoContent
                tokenName={tokenName}
                content={seoContent}
            />

        </div>
    );
}