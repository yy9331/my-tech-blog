'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

const Footer = () => {
  const pathname = usePathname();
  const { t } = useI18n();
  
  // 检查是否在 write 页面，如果是则隐藏 footer
  const isWritePage = pathname === '/write' || pathname.startsWith('/write?');
  
  if (isWritePage) {
    return null;
  }

  return (
    <footer className="bg-card dark:bg-card dark:[background-color:initial] text-muted-foreground py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sky-400 text-lg font-semibold mb-4">{t('footer_about')}</h3>
            <p className="text-sm">
              {t('footer_desc')}
            </p>
          </div>
          <div>
            <h3 className="text-sky-400 text-lg font-semibold mb-4">{t('footer_quicklinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-sky-400 transition-colors">
                  {t('nav_home')}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-sky-400 transition-colors">
                  {t('nav_categories')}
                </Link>
              </li>
              <li>
                <Link href="/write" className="hover:text-sky-400 transition-colors">
                  {t('nav_write')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sky-400 text-lg font-semibold mb-4">{t('footer_contact')}</h3>
            <ul className="space-y-2 text-sm">
              <li>{t('email')}：yuyi.gz@163.com; yuyigz@gmail.com</li>
              <li>{t('github')}：github.com/yy9331</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} My Tech Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;