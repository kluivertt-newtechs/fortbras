create or replace procedure public.sp_update_diff_sx2(p_uuid varchar, p_tabela varchar)
language plpgsql
as $$
declare
       v_query_select_dict_1 varchar;
       v_query_diff varchar;
       reg record;
       reg_diff record;
       diff_count int := 0;
      _rows int := 0;

begin

    -- Marca registros que existe no dicionário 1, mas não existem no dicionário 2
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
                            (
								s2.uuid = s.uuid and 
								s2.dict = 2 and	
								s2.x2_chave = s.x2_chave and 
								s2.x2_arquivo = s.x2_arquivo
                            ) where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 1 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existe no dicionário 2, mas não existem no dicionário 1
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
                            (
								s2.uuid = s.uuid and 
								s2.dict = 1 and	
								s2.x2_chave = s.x2_chave and 
								s2.x2_arquivo = s.x2_arquivo
                            ) where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 2 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existem dos dois dicionários, mas possuem diferenças
	v_query_select_dict_1 := 'select s.id, s2.id as id_diff from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
							(
								s2.x2_chave = s.x2_chave and 
								s2.x2_arquivo = s.x2_arquivo and
								(
                                    s.x2_path    <>  s2.x2_path    or
                                    s.x2_nome    <>  s2.x2_nome    or
                                    s.x2_nomespa <>  s2.x2_nomespa  or
                                    s.x2_nomeeng <>  s2.x2_nomeeng or
                                    s.x2_rotina  <>  s2.x2_rotina  or
                                    s.x2_modo    <>  s2.x2_modo    or
                                    s.x2_modoun  <>  s2.x2_modoun  or
                                    s.x2_modoemp <>  s2.x2_modoemp  or
                                    s.x2_delet   <>  s2.x2_delet   or
                                    s.x2_tts     <>  s2.x2_tts     or
                                    s.x2_unico   <>  s2.x2_unico   or
                                    s.x2_pyme    <>  s2.x2_pyme    or
                                    s.x2_modulo  <>  s2.x2_modulo  or
                                    s.x2_display <>  s2.x2_display  or
                                    s.x2_sysobj  <>  s2.x2_sysobj  or
                                    s.x2_usrobj  <>  s2.x2_usrobj  or
                                    s.x2_poslgt  <>  s2.x2_poslgt  or
                                    s.x2_clob    <>  s2.x2_clob    or
                                    s.x2_autrec  <>  s2.x2_autrec  or
                                    s.x2_tamfil  <>  s2.x2_tamfil  or
                                    s.x2_tamun   <>  s2.x2_tamun   or
                                    s.x2_tamemp <>  s2.x2_tamemp
								)
							)
							where s.uuid = ''' || p_uuid || ''' and s.dict = 1 and s2.id is not null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id, diff_count;	                	
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id_diff, diff_count;
		
	end loop;
end 
$$;
