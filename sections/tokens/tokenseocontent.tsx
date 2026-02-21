interface Props {
    tokenName: string;
    content?: string;
}

export default function TokenSeoContent({ tokenName, content }: Props) {
    return (
        <section className="mt-12 max-w-4xl mx-auto space-y-6">

            <h1 className="text-3xl font-bold">
                {tokenName} Token Price, Analysis, and Trading Insights
            </h1>

            <p>
                {tokenName} is a cryptocurrency token available for trading and analysis on DexTrading.
                This page provides real-time price data, trading volume, liquidity metrics,
                and advanced analytics to help traders make informed decisions.
            </p>

            <p>
                DexTrading offers professional tools for monitoring {tokenName} including
                live charts, wallet activity, historical performance, and market sentiment analysis.
                Traders can evaluate risk, identify opportunities, and optimize their trading strategies.
            </p>

            {content && (
                <>
                    <h2 className="text-2xl font-semibold mt-8">
                        What is {tokenName}?
                    </h2>

                    <p>{content}</p>
                </>
            )}

            <h2 className="text-2xl font-semibold mt-8">
                {tokenName} Market Information
            </h2>

            <p>
                The {tokenName} token operates on blockchain networks and can be traded across decentralized exchanges.
                Market performance depends on liquidity, demand, trading volume, and broader crypto market conditions.
            </p>

            <p>
                Monitoring key indicators such as price movements, volume trends, and wallet activity
                helps traders understand the strength and reliability of {tokenName}.
            </p>

            <h2 className="text-2xl font-semibold mt-8">
                Why Trade {tokenName} on DexTrading
            </h2>

            <p>
                DexTrading provides advanced analytics, fast data updates, and real-time trading insights.
                Our platform is designed to help traders identify profitable opportunities and reduce risk exposure.
            </p>

            <ul className="list-disc pl-6 space-y-2">
                <li>Real-time price tracking</li>
                <li>Advanced trading analytics</li>
                <li>Wallet activity monitoring</li>
                <li>Liquidity and volume analysis</li>
                <li>Market trend indicators</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8">
                Conclusion
            </h2>

            <p>
                Whether you are a beginner or professional trader, DexTrading provides the tools
                needed to analyze and trade {tokenName} effectively. Stay updated with real-time data,
                market analytics, and professional insights to maximize your trading performance.
            </p>

        </section>
    );
}