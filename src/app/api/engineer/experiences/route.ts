import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// GET - Get all experiences for the current engineer
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ENGINEER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { engineer: true },
    })

    if (!user?.engineer) {
      return NextResponse.json({ error: 'Engineer profile not found' }, { status: 404 })
    }

    const experiences = await prisma.experience.findMany({
      where: { engineerId: user.engineer.id },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json(experiences)
  } catch (error) {
    console.error('Error fetching experiences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    )
  }
}

// POST - Add new experience
const createExperienceSchema = z.object({
  companyName: z.string().min(1, '会社名は必須です'),
  position: z.string().min(1, '役職は必須です'),
  description: z.string().optional(),
  startDate: z.string(), // ISO date string
  endDate: z.string().nullable().optional(), // ISO date string
  isCurrent: z.boolean().default(false),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ENGINEER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { engineer: true },
    })

    if (!user?.engineer) {
      return NextResponse.json({ error: 'Engineer profile not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = createExperienceSchema.parse(body)

    // If this is marked as current, set all other experiences to not current
    if (validatedData.isCurrent) {
      await prisma.experience.updateMany({
        where: {
          engineerId: user.engineer.id,
          isCurrent: true,
        },
        data: { isCurrent: false },
      })
    }

    const experience = await prisma.experience.create({
      data: {
        engineerId: user.engineer.id,
        companyName: validatedData.companyName,
        position: validatedData.position,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        isCurrent: validatedData.isCurrent,
      },
    })

    return NextResponse.json(experience, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Error creating experience:', error)
    return NextResponse.json(
      { error: 'Failed to create experience' },
      { status: 500 }
    )
  }
}
