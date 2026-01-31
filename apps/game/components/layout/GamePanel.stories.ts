import type { Meta, StoryObj } from '@storybook/vue3'
import GamePanel from './GamePanel.vue'
import GameBackground from './GameBackground.vue'

const meta: Meta<typeof GamePanel> = {
  title: 'Layout/GamePanel',
  component: GamePanel,
  tags: ['autodocs'],
  render: (args) => ({
    components: { GamePanel, GameBackground },
    setup() {
      return { args }
    },
    template: `
      <GameBackground>
        <div style="padding: 2rem; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <GamePanel v-bind="args">
            <div style="color: white; font-family: sans-serif; text-align: center;">
              This is the content inside the panel.
            </div>
          </GamePanel>
        </div>
      </GameBackground>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
