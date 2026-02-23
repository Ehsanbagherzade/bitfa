import { useCallback, useEffect, useRef, useState } from "react";
import {
    ChartingLibraryWidgetOptions,
    IBasicDataFeed,
    IDatafeedQuotesApi,
    ResolutionString,
    widget as TradingViewWidget,
} from "@/public/static/charting_library";
import { IOhlcvData } from "@/types/datafeed.type";
import { usePathname } from "next/navigation";
import { CompareModal } from "./CompareModal";

export type CompareDataResult = {
    ohlcvData: IOhlcvData[];
    symbolName: string;
    description: string;
};

interface Props {
    chartOptions: Partial<ChartingLibraryWidgetOptions>;
    ohlcvData: IOhlcvData[];
    className?: string;
    tokenDescription: string;
    tokenExchange: string;
    theme: "dark" | "light";
    customSymbols?: Array<{
        symbol: string;
        full_name: string;
        description: string;
    }>;
    onFetchCompareData?: (contractAddress: string) => Promise<CompareDataResult>;
}

let intervalId: NodeJS.Timeout;

const MyTradingView = ({
                           chartOptions,
                           ohlcvData,
                           theme,
                           tokenDescription,
                           tokenExchange,
                           customSymbols = [],
                           onFetchCompareData,
                       }: Props) => {
    const chartContainerRef =
        useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

    const [chartIsReady, setChartIsReady] = useState(false);
    const [compareModalOpen, setCompareModalOpen] = useState(false);
    const [compareLoading, setCompareLoading] = useState(false);
    const myWidget = useRef<any>();
    const pathname = usePathname();

    const mainSymbolName = chartOptions.symbol || "DefaultSymbol";
    const compareSymbolsRef = useRef<
        Record<string, { description: string; ohlcvData: IOhlcvData[] }>
    >({});

    const calculatePriceScale = (price: number) => {
        if (!price || price <= 0) return 100;

        const decimals = Math.min(
            Math.max(Math.ceil(Math.abs(Math.log10(price))) + 2, 2),
            18
        );

        return Math.pow(10, decimals);
    };

    const getDataFeed = useCallback(
        (
            mainOhlcv: IOhlcvData[],
            mainDesc: string,
            mainEx: string,
            compareRef: typeof compareSymbolsRef
        ): IBasicDataFeed | (IBasicDataFeed & IDatafeedQuotesApi) => {
            return {
                onReady: (callback) => {
                    setTimeout(
                        () =>
                            callback({
                                supported_resolutions: [
                                    "1S",
                                    "10",
                                    "15",
                                    "30",
                                    "60",
                                    "240",
                                    "480",
                                    "720",
                                    "1440",
                                    "3D",
                                    "W",
                                    "M",
                                ] as ResolutionString[],
                                supports_marks: true,
                                supports_timescale_marks: true,
                                supports_time: true,
                            }),
                        0
                    );
                },

                resolveSymbol: (
                    symbolName,
                    onSymbolResolvedCallback,
                    onResolveError
                ) => {
                    setTimeout(() => {
                        const isMain = symbolName === mainSymbolName;
                        const compareEntry = !isMain
                            ? compareRef.current[symbolName]
                            : undefined;
                        const data = isMain
                            ? {
                                  ohlcvData: mainOhlcv,
                                  description: mainDesc,
                              }
                            : compareEntry;

                        if (!data) {
                            onResolveError?.("Unknown symbol");
                            return;
                        }

                        const { ohlcvData: barsData, description } = data;
                        const lastPrice =
                            barsData?.length > 0
                                ? barsData[barsData.length - 1].close
                                : 0;
                        const dynamicPriceScale = calculatePriceScale(lastPrice);

                        onSymbolResolvedCallback({
                            name: symbolName,
                            description,
                            exchange: mainEx,
                            timezone: "Etc/UTC",
                            minmov: 1,
                            session: "24x7",
                            has_intraday: true,
                            type: "crypto",
                            supported_resolutions: [
                                "1S",
                                "10",
                                "15",
                                "30",
                                "60",
                                "240",
                                "480",
                                "720",
                                "1440",
                                "3D",
                                "W",
                                "M",
                            ] as ResolutionString[],
                            pricescale: dynamicPriceScale,
                            ticker: symbolName,
                            listed_exchange: "Listed exchange",
                            format: "price",
                        });
                    }, 0);
                },

                getBars: (symbolInfo, resolution, periodParams, onResult) => {
                    setTimeout(() => {
                        const isMain = symbolInfo.name === mainSymbolName;
                        const compareEntry = !isMain
                            ? compareRef.current[symbolInfo.name]
                            : undefined;
                        const barsData = isMain
                            ? mainOhlcv
                            : compareEntry?.ohlcvData;

                        if (!barsData) {
                            onResult([], { noData: true });
                            return;
                        }

                        const bars = barsData
                            .filter(
                                (bar: IOhlcvData) =>
                                    bar.time * 1000 >= periodParams.from * 1000 &&
                                    bar.time * 1000 <= periodParams.to * 1000
                            )
                            .map((bar: IOhlcvData) => ({
                                time: bar.time * 1000,
                                open: bar.open,
                                high: bar.high,
                                low: bar.low,
                                close: bar.close,
                                volume: bar.volume,
                            }));

                        onResult(
                            bars,
                            bars.length ? { noData: false } : { noData: true }
                        );
                    }, 50);
                },

                subscribeBars: (
                    symbolInfo,
                    resolution,
                    onRealtimeCallback
                ) => {
                    intervalId = setInterval(() => {
                        const isMain = symbolInfo.name === mainSymbolName;
                        const compareEntry = !isMain
                            ? compareRef.current[symbolInfo.name]
                            : undefined;
                        const barsData = isMain
                            ? mainOhlcv
                            : compareEntry?.ohlcvData;
                        if (!barsData?.length) return;

                        const last = barsData[barsData.length - 1];
                        onRealtimeCallback({
                            time: last.time * 1000,
                            open: last.open,
                            high: last.high,
                            low: last.low,
                            close: last.close,
                            volume: last.volume,
                        });
                    }, 10000);
                },

                unsubscribeBars: () => {
                    clearInterval(intervalId);
                },

                searchSymbols: (
                    userInput,
                    exchange,
                    symbolType,
                    onResultReadyCallback
                ) => {
                    const symbols = [...customSymbols];
                    const filtered = symbols
                        .filter((s) =>
                            s.full_name
                                .toLowerCase()
                                .includes(userInput.toLowerCase())
                        )
                        .map((s) => ({
                            ...s,
                            exchange: tokenExchange,
                            type: "crypto",
                        }));
                    onResultReadyCallback(filtered);
                },
            };
        },
        [mainSymbolName, tokenExchange, customSymbols]
    );

    useEffect(() => {
        const widgetOptions: ChartingLibraryWidgetOptions = {
            symbol: mainSymbolName,

            datafeed: getDataFeed(
                ohlcvData,
                tokenDescription,
                tokenExchange,
                compareSymbolsRef
            ),

            interval:
                (chartOptions.interval as ResolutionString) ||
                ("4H" as ResolutionString),

            container: chartContainerRef.current,

            library_path: chartOptions.library_path,

            locale: "en",

            debug: false,

            disabled_features: ["use_localstorage_for_settings"],

            enabled_features: ["study_templates"],

            charts_storage_url: chartOptions.charts_storage_url,
            charts_storage_api_version: chartOptions.charts_storage_api_version,
            client_id: chartOptions.client_id,
            user_id: chartOptions.user_id,

            fullscreen: chartOptions.fullscreen,
            autosize: chartOptions.autosize,

            timezone: "Etc/UTC",

            theme: theme || "dark",

            custom_formatters: {
                priceFormatterFactory: () => {
                    return {
                        format: (price: number) => {
                            if (!price) return "0";

                            const isNegative = price < 0;
                            const absPrice = Math.abs(price);
                            const priceStr = Number(absPrice).toFixed(18);
                            const match = priceStr.match(/^0\.0+/);

                            let formatted: string;
                            if (match) {
                                const leadingZeros = match[0].length - 2; // -2 for "0."

                                const remaining = priceStr.substring(match[0].length);

                                const subscript = leadingZeros
                                    .toString()
                                    .split('')
                                    .map(digit => {
                                        const subscripts: Record<string, string> = {
                                            '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
                                            '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
                                        };
                                        return subscripts[digit] || digit;
                                    })
                                    .join('');

                                formatted = `0.0${subscript}${remaining}`.replace(/0+$/, '');
                            } else {
                                formatted = priceStr.replace(/\.?0+$/, "");
                            }

                            return isNegative ? `-${formatted}` : formatted;
                        },
                    };
                },
            },
        };

        myWidget.current = new TradingViewWidget(widgetOptions);

        return () => {
            myWidget.current?.remove();
        };
    }, [pathname]);

    useEffect(() => {
        if (myWidget.current) {
            myWidget.current.onChartReady(() => {
                setChartIsReady(true);
            });
        }
    }, []);

    useEffect(() => {
        if (chartIsReady) {
            myWidget.current.changeTheme(theme);
        }
    }, [theme, chartIsReady]);

    useEffect(() => {
        if (chartIsReady) {
            myWidget.current._options.datafeed = getDataFeed(
                ohlcvData,
                tokenDescription,
                tokenExchange,
                compareSymbolsRef
            );
            myWidget.current.activeChart().resetData();
        }
    }, [ohlcvData, tokenDescription, tokenExchange, chartIsReady, getDataFeed]);

    const handleAddCompare = useCallback(
        async (contractAddress: string) => {
            if (!onFetchCompareData || !myWidget.current?.activeChart) return;
            setCompareLoading(true);
            try {
                const { ohlcvData: compareOhlcv, symbolName, description } =
                    await onFetchCompareData(contractAddress);
                if (compareSymbolsRef.current[symbolName]) {
                    setCompareLoading(false);
                    return;
                }
                compareSymbolsRef.current[symbolName] = {
                    description,
                    ohlcvData: compareOhlcv,
                };
                await myWidget.current
                    .activeChart()
                    .createStudy("Compare", true, false, { symbol: symbolName });
            } finally {
                setCompareLoading(false);
            }
        },
        [onFetchCompareData]
    );

    useEffect(() => {
        if (!chartIsReady || !onFetchCompareData) return;
        myWidget.current.headerReady().then(() => {
            const btn = myWidget.current.createButton({
                align: "right",
                title: "Compare with another token",
            });
            if (btn) {
                btn.setAttribute("title", "Compare");
                btn.innerHTML =
                    '<span style="display:inline-flex;align-items:center;gap:6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h2"/><path d="M2 16h2"/><path d="M2 12h2"/><path d="M2 8h2"/><path d="M2 4h2"/><path d="M6 4h2"/><path d="M6 20h2"/><path d="M10 20h2"/><path d="M10 4h2"/><path d="M14 4h2"/><path d="M14 20h2"/><path d="M18 20h2"/><path d="M18 4h2"/><path d="M22 4h2"/><path d="M22 8h2"/><path d="M22 12h2"/><path d="M22 16h2"/><path d="M22 20h2"/></svg>Compare</span>';
                btn.addEventListener("click", () => setCompareModalOpen(true));
            }
        });
    }, [chartIsReady, onFetchCompareData]);

    return (
        <>
            <div ref={chartContainerRef} className="TVChartContainer" />
            {onFetchCompareData && (
                <CompareModal
                    open={compareModalOpen}
                    onOpenChange={setCompareModalOpen}
                    onAdd={handleAddCompare}
                    tokenExchange={tokenExchange}
                    isLoading={compareLoading}
                />
            )}
        </>
    );
};

export default MyTradingView;
