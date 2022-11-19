import { Center, Loader } from '@mantine/core'

export const AppLoading = () => {
  return (
    <Center h={'100vh'}>
      <Loader size={'xl'} variant={'bars'} />
    </Center>
  )
}
