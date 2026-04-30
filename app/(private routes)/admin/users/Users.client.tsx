'use client';

import UsersList from '@/components/Admin/UsersList/UsersList';
import CreateAndEditUserForm from '@/components/forms/CreateAndUpdateUserForm/CreateAndEditUserForm';
import Button from '@/components/UI/Button/Button';
import Filters, { FiltersItem } from '@/components/UI/Filters/Filters';
import { getRoleOptions } from '@/constants/roleType';
import { getStatusOptions } from '@/constants/userStatus';
import { getAllUsers } from '@/lib/api/users';
import { usePageStore } from '@/lib/store/pageStore';
import { createOptionMapper } from '@/lib/utils/translationMapper';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import css from './Users.module.css';
import { UserRoles, UserStatus } from '@/types/userTypes';
import NoFound from '@/components/UI/NoFound/NoFound';

const AdminUsersClientPage = () => {
  const [search, setSearch] = useState<string>('');
  const [role, setRole] = useState<UserRoles | string>('');
  const [status, setStatus] = useState<UserStatus | string>('');
  const [page, setPage] = useState(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [debouncedSearch] = useDebounce(search, 500);

  const tPage = useTranslations('AdminPage');
  const t = useTranslations('AdminPage.Users');
  const tRoles = useTranslations('Roles');
  const tStatuses = useTranslations('Statuses');
  const setPageTitle = usePageStore(state => state.setPageTitle);

  useEffect(() => {
    setPageTitle(tPage('titlePageForStore'));
  }, []);

  const roleOptions = getRoleOptions();
  const roleMapper = createOptionMapper(roleOptions);

  const statusOptions = getStatusOptions();
  const statusMapper = createOptionMapper(statusOptions);

  const filters: FiltersItem[] = [
    {
      id: 'search',
      type: 'input',
      label: t('search'),
      value: search,
      placeholder: t('searchPlaceholder'),
      onChange: setSearch,
      icon: 'search',
    },
    {
      id: 'role',
      type: 'select',
      label: t('role'),
      value: roleMapper.getLabelByValue(role) ?? tRoles('all'),
      options: roleMapper.labelsArray,
      onSelect: label => {
        const value = roleMapper.getValueByLabel(label) ?? '';
        setRole(value);
      },
    },
    {
      id: 'status',
      type: 'select',
      label: t('status'),
      value: statusMapper.getLabelByValue(status) ?? tStatuses('all'),
      options: statusMapper.labelsArray,
      onSelect: label => {
        const value = statusMapper.getValueByLabel(label) ?? '';
        setStatus(value);
      },
    },
  ];

  const {
    data: users,
    isSuccess,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      'users',
      debouncedSearch || undefined,
      role || undefined,
      status || undefined,
      page,
    ],
    queryFn: () =>
      getAllUsers({
        search: debouncedSearch,
        role: role as UserRoles | undefined,
        status: status as UserStatus | undefined,
        page,
      }),
    placeholderData: keepPreviousData,
  });

  console.log(users);

  const handleCreateUser = () => {
    setIsOpenModal(true);
  };

  return (
    <section className={css.section}>
      <div className={css.head_container}>
        <div className={css.title_container}>
          <h1 className="title">{t('title')}</h1>
          <p className="subtitle">{t('subtitle')}</p>
        </div>
        <Button
          type="button"
          className={`${css.btn} button button--blue`}
          onClick={handleCreateUser}
        >
          <svg width="16" height="16" className={css.btn_icon}>
            <use href="/sprite.svg#plus"></use>
          </svg>
          {t('newUser')}
        </Button>
      </div>
      <Filters items={filters} />
      {users?.length === 0 && (
        <NoFound
          title="Nessun risultato trovato"
          message="Prova a modificare o rimuovere i filtri per visualizzare più utenti"
        />
      )}
      {isSuccess && users.length > 0 && <UsersList users={users ?? []} />}
      {isOpenModal && (
        <CreateAndEditUserForm
          onClose={() => {
            setIsOpenModal(false);
          }}
        />
      )}
    </section>
  );
};

export default AdminUsersClientPage;
