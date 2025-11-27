import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// PUT - Update experience
const updateExperienceSchema = z.object({
  companyName: z.string().min(1, '会社名は必須です'),
  position: z.string().min(1, '役職は必須です'),
  description: z.string().optional(),
  startDate: z.string(), // ISO date string
  endDate: z.string().nullable().optional(), // ISO date string
  isCurrent: z.boolean().default(false),
})

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const experienceId = params.id

    // Check if experience belongs to this engineer
    const existingExperience = await prisma.experience.findUnique({
      where: { id: experienceId },
    })

    if (!existingExperience || existingExperience.engineerId !== user.engineer.id) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = updateExperienceSchema.parse(body)

    // If this is marked as current, set all other experiences to not current
    if (validatedData.isCurrent) {
      await prisma.experience.updateMany({
        where: {
          engineerId: user.engineer.id,
          isCurrent: true,
          id: { not: experienceId },
        },
        data: { isCurrent: false },
      })
    }

    const updatedExperience = await prisma.experience.update({
      where: { id: experienceId },
      data: {
        companyName: validatedData.companyName,
        position: validatedData.position,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        isCurrent: validatedData.isCurrent,
      },
    })

    return NextResponse.json(updatedExperience)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Error updating experience:', error)
    return NextResponse.json(
      { error: 'Failed to update experience' },
      { status: 500 }
    )
  }
}

// DELETE - Delete experience
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const experienceId = params.id

    // Check if experience belongs to this engineer
    const existingExperience = await prisma.experience.findUnique({
      where: { id: experienceId },
    })

    if (!existingExperience || existingExperience.engineerId !== user.engineer.id) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    await prisma.experience.delete({
      where: { id: experienceId },
    })

    return NextResponse.json({ message: 'Experience deleted successfully' })
  } catch (error) {
    console.error('Error deleting experience:', error)
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    )
  }
}
