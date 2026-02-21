interface Props {
    tokenName: string;
    content: string;
}

export default function TokenSeoContent({ tokenName, content }: Props) {
    if (!content) return null;

    return (
        <section className="mt-8">
            <h2 className="text-lg font-semibold mb-3">
                About {tokenName}
            </h2>

            <div
                className="prose max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </section>
    );
}