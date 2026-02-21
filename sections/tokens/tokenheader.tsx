import {
    Breadcrumb,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";

import { TOKEN_PAGE_PARAMS } from "@/utils/pageParams";
import { minifyContract } from "@/utils/truncate";

interface Props {
    tokenName: string;
    params: { params: [string, string] };
}

export default function TokenHeader({ tokenName, params }: Props) {
    const network =
        params.params[TOKEN_PAGE_PARAMS.NETWORK].toUpperCase();

    const contract =
        params.params[TOKEN_PAGE_PARAMS.CONTRACT_ADDRESS];

    return (
        <>
            <Breadcrumb className="mt-12 mb-4">
                <BreadcrumbList>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>

                    <BreadcrumbLink href={`/tokens/${network}/${contract}`}>
                        {minifyContract(contract)}
                    </BreadcrumbLink>
                </BreadcrumbList>
            </Breadcrumb>

            {/* مهم‌ترین بخش SEO */}
            <h1 className="text-xl font-semibold">
                {tokenName.toUpperCase()} Token Price, Chart and Market Data on {network}
            </h1>
        </>
    );
}