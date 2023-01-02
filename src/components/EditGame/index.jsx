import { useParams } from 'react-router-dom';
import { message } from 'antd';
import axios from 'axios';
import { useQuery, useMutation } from 'react-query';
import dayjs from 'dayjs';
import { useState } from 'react';

import BackButton from '../BackButton';
import GameForm from '../GameForm';
import Title from 'antd/es/typography/Title';

const URL = import.meta.env.VITE_URL;

export default function EditGame() {
  const { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [gameData, setGameData] = useState([]);
  function updateGameData(value) {
    const { Name, Publisher, Developer, Released, genres } = value.attributes;
    setGameData([
      { name: 'name', value: Name },
      { name: 'publisher', value: Publisher },
      { name: 'developer', value: Developer },
      { name: 'released', value: dayjs(Released) },
      { name: 'genres', value: genres.data.map((genre) => genre.id) },
    ]);
  }
  const { isLoading, isError } = useQuery(
    'game',
    () => {
      return axios.get(`${URL}/games/${id}`, {
        params: {
          populate: '*',
        },
      });
    },
    {
      select: (data) => data.data.data,
      cacheTime: 0,
      onSuccess: updateGameData,
    },
  );

  const { mutate } = useMutation(
    (data) => {
      return axios.put(`${URL}/games/${id}`, data, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TOKEN}`,
        },
      });
    },
    {
      onSuccess: () => {
        messageApi.open({ type: 'success', content: 'Entry updated successfully' });
      },
      onError: (error) => {
        messageApi.open({ type: 'error', content: `${error}` });
      },
    },
  );

  function handleFinish(value) {
    const { name, publisher, developer, released, genres } = value;
    mutate({
      data: {
        Name: name,
        Publisher: publisher,
        Developer: developer,
        Released: released,
        genres,
      },
    });
  }

  return (
    <>
      {contextHolder}
      <BackButton />
      {isError ? (
        <Title level={3}>An error occured. Please try again later</Title>
      ) : (
        <GameForm onFinish={handleFinish} fields={gameData} loading={isLoading} resetOnSubmit={false} />
      )}
    </>
  );
}
