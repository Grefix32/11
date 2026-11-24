import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://ajzxaolddmatbinohmbt.supabase.co';
const supabaseKey = 'sb_publishable_lG60hCmdehMvEXoFeKcuvA_32T-ipq-';
const db = createClient(supabaseUrl, supabaseKey);

const status = document.querySelector('#status');
const list = document.querySelector('#nodes-list');
const nodeForm = document.querySelector('#node-form');
const pharmacyNameInput = document.querySelector('#pharmacy-name');
const ipAddressInput = document.querySelector('#ip-address');

async function loadNodes() {
  status.textContent = 'Завантаження вузлів мережі...';
  list.replaceChildren();

  try {
    const { data, error } = await db
      .from('pharmacy_nodes')
      .select('id, pharmacy_name, ip_address')
      .order('id', { ascending: true });

    if (error) {
      console.error('Помилка завантаження:', error);
      status.textContent = 'Не вдалося завантажити вузли мережі. Перевірте консоль браузера.';
      return;
    }

    if (data.length === 0) {
      status.textContent = 'Записів немає.';
      return;
    }

    for (const node of data) {
      const item = document.createElement('li');
      item.textContent = `${node.pharmacy_name} – ${node.ip_address}`;
      list.append(item);
    }

    status.textContent = `Знайдено вузлів: ${data.length}`;
  } catch (error) {
    console.error('Помилка запиту:', error);
    status.textContent = 'Не вдалося виконати запит.';
  }
}

nodeForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const pharmacy_name = pharmacyNameInput.value.trim();
  const ip_address = ipAddressInput.value.trim();

  if (
    pharmacy_name.length === 0 ||
    pharmacy_name.length > 150 ||
    ip_address.length === 0 ||
    ip_address.length > 150
  ) {
    status.textContent = 'Перевірте назву аптеки та IP-адресу.';
    return;
  }

  const submitButton = nodeForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  status.textContent = 'Додавання вузла...';

  try {
    const { error } = await db
      .from('pharmacy_nodes')
      .insert({ pharmacy_name, ip_address });

    if (error) {
      console.error('Помилка додавання:', error);
      status.textContent = 'Не вдалося додати вузол мережі.';
      return;
    }

    nodeForm.reset();
    await loadNodes();
  } catch (error) {
    console.error('Помилка запиту:', error);
    status.textContent = 'Не вдалося виконати запит.';
  } finally {
    submitButton.disabled = false;
  }
});

loadNodes();
