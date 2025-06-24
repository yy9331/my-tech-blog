'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();
  
  // 检查是否在 write 页面，如果是则隐藏 footer
  const isWritePage = pathname === '/write' || pathname.startsWith('/write?');
  
  if (isWritePage) {
    return null;
  }

  return (
    <footer className="bg-card dark:bg-card dark:[background-color:initial] text-muted-foreground py-8 mt-[30px]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sky-400 text-lg font-semibold mb-4">关于我们</h3>
            <p className="text-sm">
              分享技术见解，记录学习历程，探讨编程之道。
            </p>
          </div>
          <div>
            <h3 className="text-sky-400 text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-sky-400 transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-sky-400 transition-colors">
                  分类
                </Link>
              </li>
              <li>
                <Link href="/write" className="hover:text-sky-400 transition-colors">
                  写文章
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sky-400 text-lg font-semibold mb-4">联系方式</h3>
            <ul className="space-y-2 text-sm">
              <li>邮箱：yuyi.gz@163.com; yuyigz@gmail.com</li>
              <li>GitHub：github.com/yy9331</li>
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