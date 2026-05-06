import { mount } from '@vue/test-utils'
import CadastroFuncionarioView from '../views/CadastroFuncionarioView.vue'

describe('CadastroFuncionarioView', () => {

  it('deve mostrar erro quando o nome não for preenchido', async () => {
    const wrapper = mount(CadastroFuncionarioView)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('O nome do funcionário é obrigatório.')
  })

  it('não deve mostrar erro quando o nome for preenchido', async () => {
    const wrapper = mount(CadastroFuncionarioView)

    await wrapper.find('input#nome').setValue('Maria Silva')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).not.toContain('O nome do funcionário é obrigatório.')
  })

  it('deve limpar o erro ao tentar cadastrar com nome válido', async () => {
    const wrapper = mount(CadastroFuncionarioView)

    // primeiro dispara erro
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('O nome do funcionário é obrigatório.')

    // depois preenche e submete de novo
    await wrapper.find('input#nome').setValue('João Santos')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).not.toContain('O nome do funcionário é obrigatório.')
  })

})
