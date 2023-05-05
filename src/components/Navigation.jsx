import { useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'

import { Button } from '@/components/Button'
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'

function useInitialValue(value, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

function TopLevelNavItem({ href, children }) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

function NavLink({ href, tag, active, isAnchorLink = false, children }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 text-sm transition',
        isAnchorLink ? 'pl-7' : 'pl-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </Link>
  )
}

function VisibleSectionHighlight({ group, pathname }) {
  let [sections, visibleSections] = useInitialValue(
    [
      useSectionStore((s) => s.sections),
      useSectionStore((s) => s.visibleSections),
    ],
    useIsInsideMobileNavigation()
  )

  let isPresent = useIsPresent()
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0]
    )
  )
  let itemHeight = remToPx(2)
  let height = isPresent
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight
  let top =
    group.links.findIndex((link) => link.href === pathname) * itemHeight +
    firstVisibleSectionIndex * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height, top }}
    />
  )
}

function ActivePageMarker({ group, pathname }) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let activePageIndex = group.links.findIndex((link) => link.href === pathname)
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-emerald-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({ group, className }) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [router, sections] = useInitialValue(
    [useRouter(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation
  )

  let isActiveGroup =
    group.links.findIndex((link) => link.href === router.pathname) !== -1

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <VisibleSectionHighlight group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === router.pathname}>
                {link.title}
              </NavLink>
              <AnimatePresence mode="popLayout" initial={false}>
                {link.href === router.pathname && sections.length > 0 && (
                  <motion.ul
                    role="list"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }}
                  >
                    {sections.map((section) => (
                      <li key={section.id}>
                        <NavLink
                          href={`${link.href}#${section.id}`}
                          tag={section.tag}
                          isAnchorLink
                        >
                          {section.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export const navigation = [
  {
    title: 'Javascript',
    links: [
      { title: '词法环境', href: '/' },
      { title: '问题摘要', href: '/quickstart' },
      { title: 'Chrome V8引擎', href: '/sdks' },
      { title: 'Chrome extensions', href: '/authentication' },
      { title: '语法树类型标识', href: '/pagination' },
      { title: '浏览器运行机制', href: '/errors' },
    ],
  },
  {
    title: 'Babel',
    links: [
      { title: 'Babel乱笔', href: '/contacts' },
      { title: 'Babel疑问', href: '/conversations' },
      { title: 'babel-core', href: '/messages' },
      { title: '初探AST', href: '/groups' },
      { title: 'babelrc杂谈', href: '/attachments' },
      { title: 'Babel预设Presets', href: '/attachments' },
    ],
  },
  {
    title: 'Wepback',
    links: [
      { title: '整体配置结构', href: '/contacts' },
      { title: '简易版打包实现库', href: '/conversations' },
      { title: '打包后代码片段', href: '/messages' },
      { title: 'webpack问题点', href: '/groups' },
      { title: '配置文档', href: '/webpack-config' },
    ],
  },
  {
    title: 'Next.js',
    links: [
      { title: 'Next架构图', href: '/contacts' },
      { title: 'Next.js VS Remix', href: '/conversations' },
      { title: 'CSR、SSR、SR、HR', href: '/messages' },
      { title: 'Next.config.js', href: '/groups' },
      { title: 'Next.js 技术文档', href: '/attachments' },
      { title: 'Next.js 源码浅析', href: '/attachments' },
    ],
  },
  {
    title: 'React',
    links: [
      { title: 'React架构图', href: '/contacts' },
      { title: '精通React提纲', href: '/conversations' },
      { title: 'React 名词解释', href: '/messages' },
      { title: '调试React代码', href: '/groups' },
      { title: 'React 18新特性', href: '/attachments' },
    ],
  },
  {
    title: '前端算法实战',
    links: [
      { title: '前端算法实战', href: '/contacts' },
      { title: '网站大全', href: '/contacts' },
    ],
  },
  {
    title: 'Shell',
    links: [
      { title: '常见Shell命令', href: '/contacts' },
      { title: 'Shell特性Login', href: '/conversations' },
      { title: 'Shader', href: '/messages' },
    ],
  },
  {
    title: 'Typescript',
    links: [
      { title: 'TS学习大纲', href: '/contacts' },
      { title: 'TS-JSX', href: '/conversations' },
      { title: 'tsconfig.json', href: '/messages' },
      { title: 'TS代码片段', href: '/messages' },
      { title: 'TS 高级类型使用', href: '/messages' },
      { title: 'declare使用姿势', href: '/messages' },
      { title: 'TS 记录摘要', href: '/messages' },
    ],
  },
  {
    title: 'Vue',
    links: [
      { title: '混入和插件机制', href: '/contacts' },
      { title: '依赖收集', href: '/conversations' },
      { title: '响应原理如何实现', href: '/messages' },
      { title: '生命周期', href: '/messages' },
      { title: '生命周期', href: '/messages' },
    ],
  },
  {
    title: '前端工程化',
    links: [
      { title: '统一标准：流程、规范统一', href: '/contacts' },
      { title: '微前端', href: '/conversations' },
    ],
  },
  {
    title: '网络知识',
    links: [
      { title: 'JWT', href: '/contacts' },
      { title: '网络七层&协议', href: '/conversations' },
      { title: '协商&强缓存', href: '/messages' },
      { title: 'HTTPS 详解', href: '/messages' },
    ],
  },
  {
    title: '性能优化',
    links: [
      { title: 'PerformanceObserver code', href: '/contacts' },
      { title: '性能杂谈', href: '/conversations' },
      { title: '2020 - web-vitals', href: '/conversations' },
      { title: '2018 - Lighthouse', href: '/messages' },
      { title: '2017 - Audit', href: '/messages' },
      { title: '2015 - PWA & AMP', href: '/messages' },
      { title: 'RAIL 量化使用者体验', href: '/messages' },
      { title: 'Chrome 性能工具 - Audit', href: '/messages' },
    ],
  },
]

export function Navigation(props) {
  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="#">API</TopLevelNavItem>
        <TopLevelNavItem href="#">Documentation</TopLevelNavItem>
        <TopLevelNavItem href="#">Support</TopLevelNavItem>
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 && 'md:mt-0'}
          />
        ))}
        <li className="sticky bottom-0 z-10 mt-6 min-[416px]:hidden">
          <Button href="#" variant="filled" className="w-full">
            Sign in
          </Button>
        </li>
      </ul>
    </nav>
  )
}
