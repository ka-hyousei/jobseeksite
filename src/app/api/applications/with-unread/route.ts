import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET - 応募一覧と各応募の未読メッセージ数を取得
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: {
        company: true,
        engineer: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let applications: any[] = []

    if (user.engineer) {
      // 技術者の場合
      applications = await prisma.application.findMany({
        where: { engineerId: user.engineer.id },
        include: {
          job: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // 各応募の未読メッセージ数を取得
      const applicationsWithUnread = await Promise.all(
        applications.map(async (app) => {
          const unreadCount = await prisma.message.count({
            where: {
              applicationId: app.id,
              senderType: 'COMPANY',
              isRead: false,
            },
          })
          return { ...app, unreadCount }
        })
      )

      return NextResponse.json(applicationsWithUnread)
    } else if (user.company) {
      // 企業の場合 - 求人応募とIT案件応募の両方を取得
      const jobApplications = await prisma.application.findMany({
        where: {
          job: {
            companyId: user.company.id,
          },
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              companyId: true,
            },
          },
          engineer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
              currentPosition: true,
              yearsOfExperience: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // IT案件応募も取得
      const projectApplications = await prisma.projectApplication.findMany({
        where: {
          project: {
            companyId: user.company.id,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
          engineer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
              currentPosition: true,
              yearsOfExperience: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // 求人応募の未読メッセージ数を取得
      const jobAppsWithUnread = await Promise.all(
        jobApplications.map(async (app) => {
          const unreadCount = await prisma.message.count({
            where: {
              applicationId: app.id,
              senderType: 'ENGINEER',
              isRead: false,
            },
          })
          return {
            ...app,
            unreadCount,
            applicationType: 'job' as const
          }
        })
      )

      // IT案件応募を同じフォーマットに変換
      const projectAppsFormatted = projectApplications.map(app => ({
        id: app.id,
        status: app.status,
        createdAt: app.createdAt,
        unreadCount: 0, // IT案件応募にはメッセージ機能がないため0
        job: {
          id: app.project.id,
          title: app.project.title + ' (IT案件)',
          companyId: user.company!.id,
        },
        engineer: app.engineer,
        applicationType: 'project' as const
      }))

      // 両方を結合してソート
      const allApplications = [...jobAppsWithUnread, ...projectAppsFormatted]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return NextResponse.json(allApplications)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching applications with unread count:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
