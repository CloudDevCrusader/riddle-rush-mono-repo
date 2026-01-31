import type { Meta, StoryObj } from '@storybook/vue3'
import GameBackground from './GameBackground.vue'

const meta: Meta<typeof GameBackground> = {
  title: 'Layout/GameBackground',
  component: GameBackground,
  tags: ['autodocs'],
  argTypes: {
    default: {
      control: {
        type: 'text',
      },
      description: 'Slot content',
    },
  },
  args: {
    default: 'Content goes here',
  },
  render: (args: any) => ({
    components: { GameBackground },
    template: `
      <GameBackground>
        <div style="color: white; font-size: 2rem; padding: 2rem; text-align: center;">
          ${args.default}
        </div>
      </GameBackground>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
