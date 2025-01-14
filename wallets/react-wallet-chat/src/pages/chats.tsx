import { Fragment, useCallback, useEffect, useState } from 'react'
import { Row, Text } from '@nextui-org/react'
import { useRouter } from 'next/router'
import { FiPlus } from 'react-icons/fi'
import { useSnapshot } from 'valtio'

import ChatSummaryCard from '@/components/ChatSummaryCard'
import PageHeader from '@/components/PageHeader'
import ChatRequestsButton from '@/components/ChatRequestsButton'
import { chatClient } from '@/utils/WalletConnectUtil'
import ChatPrimaryCTAButton from '@/components/ChatPrimaryCTAButton'
import SettingsStore from '@/store/SettingsStore'
import { Web3Modal } from '@web3modal/standalone'
import { HiQrcode } from 'react-icons/hi'

const web3modal = new Web3Modal({})

export default function ChatsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const [chatThreads, setChatThreads] = useState<
    { topic: string; selfAccount: string; peerAccount: string }[]
  >([])

  const [chatInvites, setChatInvites] = useState<any[]>([])

  const inviteQrCode = useCallback(async () => {
    const idx = SettingsStore.state.account === 0 ? 1 : 0
    const uri = `${window.location.origin}/newChat?accountIndex=${idx}&target=eip155:1:${SettingsStore.state.eip155Address}`

    web3modal.openModal({ uri })
  }, [])

  const initChatClient = async () => {
    console.log(chatClient)

    console.log('chatInvites on load:', chatClient.chatInvites.getAll())
    console.log('chatThreads on load:', chatClient.chatThreads.getAll())
    console.log('chatMessages on load:', chatClient.chatMessages.getAll())
    setChatThreads(chatClient.chatThreads.getAll())
    setChatInvites(chatClient.chatInvites.getAll())

    chatClient.on('chat_invite', async args => {
      console.log('chat_invite:', args)
      web3modal.closeModal()
      console.log(chatClient.chatInvites.getAll())
      setChatInvites(chatClient.chatInvites.getAll())
    })

    chatClient.on('chat_joined', async args => {
      console.log('chat_joined:', args)
      console.log(chatClient.chatThreads.getAll())
      setChatThreads(chatClient.chatThreads.getAll())
    })

    setIsLoading(false)
  }

  useEffect(() => {
    initChatClient()
  }, [])

  return (
    <Fragment>
      <PageHeader
        title="Chat"
        ctaButton={
          <Row justify="space-evenly">
            <ChatPrimaryCTAButton icon={<HiQrcode />} onClick={inviteQrCode} />
            <ChatPrimaryCTAButton icon={<FiPlus />} onClick={() => router.push('/newChat')} />
          </Row>
        }
      />

      <Row justify="center" align="center" css={{ paddingBottom: '$5' }}>
        {chatInvites.length ? <ChatRequestsButton requestCount={chatInvites.length} /> : null}
        {/* <ChatRequestsButton requestCount={chatInvites.length} /> */}
      </Row>

      {isLoading ? (
        <Text css={{ opacity: '0.5', textAlign: 'center', marginTop: '$20' }}>
          Fetching chats...
        </Text>
      ) : chatThreads.length ? (
        chatThreads.map(props => {
          return <ChatSummaryCard key={props.topic} {...props} />
        })
      ) : (
        <Text css={{ opacity: '0.5', textAlign: 'center', marginTop: '$20' }}>No chats</Text>
      )}
    </Fragment>
  )
}
