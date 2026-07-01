export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-[26px]">
      <div>
        <div className="font-heading font-medium text-[26px] md:text-[32px] leading-none text-[#2e2823]">{title}</div>
        <div className="text-[13px] text-[#8a7d6e] font-light mt-1">{subtitle}</div>
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}
