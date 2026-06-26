'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wand2, Sparkles, Music, Mic, Download, Share2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 hero-gradient overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">AI 音乐创作</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            用 AI 秒级创作
            <br />
            <span className="gradient-text">原创歌曲</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            用 AI 写歌词、选风格和情绪、生成专业级音乐。无需乐器，人人都是音乐人。
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/create">
              <Button size="lg" variant="brand" className="text-base px-8 py-6">
                开始创作 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-6">
                登录
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* How it Works */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">如何使用</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          三步创作你的专属歌曲
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Wand2, title: '写歌词', desc: '描述你的主题，让 AI 生成专业歌词，或自己动手创作。', color: 'from-purple-500 to-purple-600' },
            { icon: Music, title: '选择风格', desc: '13 种音乐风格和 11 种情绪可选，从流行到爵士，从欢快到戏剧。', color: 'from-blue-500 to-blue-600' },
            { icon: Mic, title: '生成音乐', desc: 'AI 将你的歌词变成完整的歌曲，带人声和伴奏，秒级完成。', color: 'from-indigo-500 to-indigo-600' },
          ].map((step, i) => (
            <div key={i} className="glass rounded-2xl p-8 text-center card-glow group">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br ${step.color} p-4 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">为什么选择 MusiCraft？</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Download, title: '下载 MP3', desc: '高品质 MP3 格式导出' },
              { icon: Share2, title: '轻松分享', desc: '生成分享链接' },
              { icon: Sparkles, title: '持续进化', desc: '模型定期更新，质量不断提升' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Styles Grid */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">音乐风格</h2>
        <p className="text-gray-400 text-center mb-10">13 种丰富风格</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['流行', '摇滚', '嘻哈', 'R&B', '电子', '古典', '爵士', '民谣', '轻音', '原声', '氛围', '乡村', '说唱'].map((style) => (
            <div key={style} className="px-5 py-2.5 rounded-full glass text-sm hover:border-purple-500/30 hover:text-purple-300 transition-all cursor-default">
              {style}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-4xl mx-auto px-4 text-center">
        <div className="glass rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">准备好创作了吗？</h2>
          <p className="text-gray-400 mb-8">赠送 50 积分，立即开始创作。无需信用卡。</p>
          <Link href="/register">
            <Button size="lg" variant="brand">
              免费开始 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-500">
        MusiCraft — AI 音乐创作
      </footer>
    </div>
  )
}
