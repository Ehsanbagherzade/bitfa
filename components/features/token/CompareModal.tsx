"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { searchToken } from "@/services/http/token.http";
import { Daum } from "@/types/token.type";

interface CompareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (tokenAddress: string) => Promise<void>;
    tokenExchange: string;
    exchangeLogoUrl?: string;
    isLoading?: boolean;
}

function getTokenAddress(item: Daum): string {
    return item.address ?? item.id?.split("_")[1] ?? "";
}

export function CompareModal({
    open,
    onOpenChange,
    onAdd,
    tokenExchange,
    exchangeLogoUrl,
    isLoading = false,
}: CompareModalProps) {
    const [searchInput, setSearchInput] = useState("");
    const [selectedToken, setSelectedToken] = useState<Daum | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [debouncedSearch] = useDebounce(searchInput, 300);

    const { data: tokenData, isFetching: isSearching } = useQuery({
        queryKey: ["compareTokenSearch", debouncedSearch],
        queryFn: () =>
            searchToken({
                params: { currencyAddress: debouncedSearch },
            }),
        enabled: debouncedSearch.length >= 2,
    });

    const tokenList = tokenData?.data ?? [];
    const showDropdown =
        dropdownOpen &&
        (isSearching || tokenList.length > 0 || debouncedSearch.length >= 2);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectToken = (item: Daum) => {
        setSelectedToken(item);
        setSearchInput(item.name ?? item.attributes?.name ?? "");
        setDropdownOpen(false);
        setError(null);
    };

    const handleAdd = async () => {
        const address = selectedToken
            ? getTokenAddress(selectedToken)
            : searchInput.trim();
        if (!address) {
            setError("Please search and select a token");
            return;
        }
        setError(null);
        try {
            await onAdd(address);
            setSearchInput("");
            setSelectedToken(null);
            onOpenChange(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add symbol");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1e222d] border-[#2a2e39] text-white gap-6 max-w-[400px] rounded-xl">
                <DialogHeader className="space-y-4">
                    <div className="flex justify-center items-center gap-2">
                        {exchangeLogoUrl ? (
                            <Image
                                src={exchangeLogoUrl}
                                alt=""
                                width={28}
                                height={28}
                                unoptimized
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-[#f23645]" />
                        )}
                        <DialogTitle className="text-xl font-semibold uppercase tracking-wide text-white">
                            Compare
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="space-y-2 relative" ref={dropdownRef}>
                        <Label className="text-white text-sm font-medium">
                            Asset
                        </Label>
                        <Input
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value);
                                setSelectedToken(null);
                                setDropdownOpen(true);
                                setError(null);
                            }}
                            onFocus={() => setDropdownOpen(true)}
                            placeholder="Search by token name or address"
                            className="bg-[#2a2e39] border-[#363a45] text-white placeholder:text-gray-400 rounded-lg h-10"
                        />
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-[#363a45] bg-[#2a2e39] shadow-lg">
                                {isSearching ? (
                                    <div className="px-3 py-4 text-center text-sm text-gray-400">
                                        Searching…
                                    </div>
                                ) : tokenList.length === 0 ? (
                                    <div className="px-3 py-4 text-center text-sm text-gray-400">
                                        {debouncedSearch.length < 2
                                            ? "Type at least 2 characters"
                                            : "No tokens found"}
                                    </div>
                                ) : (
                                    <ul className="py-1">
                                        {tokenList.map((item) => {
                                            const addr = getTokenAddress(item);
                                            const name =
                                                item.name ??
                                                item.attributes?.name ??
                                                addr;
                                            return (
                                                <li key={item.id ?? addr}>
                                                    <button
                                                        type="button"
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-[#363a45] transition-colors"
                                                        onClick={() =>
                                                            handleSelectToken(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        {item.logo_url ||
                                                        item.imageUrl2 ? (
                                                            <Image
                                                                src={
                                                                    item.logo_url ||
                                                                    item.imageUrl2 ||
                                                                    ""
                                                                }
                                                                alt=""
                                                                width={24}
                                                                height={24}
                                                                unoptimized
                                                                className="rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-[#363a45]" />
                                                        )}
                                                        <span className="truncate">
                                                            {name}
                                                        </span>
                                                        {addr && (
                                                            <span className="ml-auto text-xs text-gray-500 truncate max-w-[120px]">
                                                                {addr.slice(0, 6)}…{addr.slice(-4)}
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white text-sm font-medium">
                            Exchange
                        </Label>
                        <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-[#2a2e39] border border-[#363a45] text-white">
                            {exchangeLogoUrl ? (
                                <Image
                                    src={exchangeLogoUrl}
                                    alt=""
                                    width={20}
                                    height={20}
                                    unoptimized
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-[#f23645]" />
                            )}
                            <span className="text-sm">{tokenExchange}</span>
                        </div>
                    </div>
                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}
                    <Button
                        onClick={handleAdd}
                        disabled={isLoading}
                        className="w-full bg-[#f23645] hover:bg-[#e02b3a] text-white font-semibold rounded-lg h-11"
                    >
                        {isLoading ? "Adding…" : "Add"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
